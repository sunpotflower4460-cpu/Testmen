import Foundation
import Capacitor
import StoreKit

/// 「広告を消す」非消耗型アプリ内課金（StoreKit 2）をWeb側へ公開するCapacitorプラグイン。
///
/// 製品IDはWeb側の `src/lib/config.ts`（PRODUCT_REMOVE_ADS）から毎回渡される。
/// 購入状態は端末上の `Transaction.currentEntitlements` で判定するため、
/// 起動時の確認はオフラインでも動作し、独自のサーバーやアカウントは不要。
@objc(StampPurchasesPlugin)
public class StampPurchasesPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "StampPurchasesPlugin"
    public let jsName = "StampPurchases"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getProduct", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "isPurchased", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "purchase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "restore", returnType: CAPPluginReturnPromise)
    ]

    private var updatesTask: Task<Void, Never>?

    deinit {
        updatesTask?.cancel()
    }

    // MARK: - Lifecycle

    /// アプリ外での購入（家族共有・返金・Ask to Buy承認・オファーコード等）を拾って、
    /// Web側へ `premiumChanged` を通知する。
    override public func load() {
        updatesTask = Task { [weak self] in
            for await result in Transaction.updates {
                guard let self = self else { return }
                guard case .verified(let transaction) = result else { continue }
                await transaction.finish()
                let purchased = await self.ownsProduct(transaction.productID)
                self.notifyListeners("premiumChanged", data: [
                    "productId": transaction.productID,
                    "purchased": purchased
                ])
            }
        }
    }

    // MARK: - Plugin methods

    /// 製品情報（ローカライズ済みの価格）を返す。見つからない場合は found=false。
    @objc func getProduct(_ call: CAPPluginCall) {
        guard let productId = call.getString("productId") else {
            call.reject("productId is required")
            return
        }
        Task {
            do {
                let products = try await Product.products(for: [productId])
                if let product = products.first {
                    call.resolve([
                        "found": true,
                        "displayPrice": product.displayPrice,
                        "displayName": product.displayName
                    ])
                } else {
                    call.resolve(["found": false])
                }
            } catch {
                call.reject("getProduct failed: \(error.localizedDescription)")
            }
        }
    }

    /// 起動時の購入状態確認。端末に保存された権利情報のみを見る（通信不要）。
    @objc func isPurchased(_ call: CAPPluginCall) {
        guard let productId = call.getString("productId") else {
            call.reject("productId is required")
            return
        }
        Task {
            let purchased = await ownsProduct(productId)
            call.resolve(["purchased": purchased])
        }
    }

    /// 購入処理。status は success / cancelled / pending / error。
    @objc func purchase(_ call: CAPPluginCall) {
        guard let productId = call.getString("productId") else {
            call.reject("productId is required")
            return
        }
        Task {
            do {
                guard let product = try await Product.products(for: [productId]).first else {
                    call.resolve(["status": "error", "message": "product not found"])
                    return
                }
                let result = try await product.purchase()
                switch result {
                case .success(let verification):
                    switch verification {
                    case .verified(let transaction):
                        await transaction.finish()
                        call.resolve(["status": "success"])
                    case .unverified:
                        // 検証に失敗した取引は権利を与えない（finishもしない）。
                        call.resolve(["status": "error", "message": "unverified transaction"])
                    }
                case .userCancelled:
                    call.resolve(["status": "cancelled"])
                case .pending:
                    // 「承認と購入のリクエスト」など。承認されると Transaction.updates で通知される。
                    call.resolve(["status": "pending"])
                @unknown default:
                    call.resolve(["status": "error", "message": "unknown purchase result"])
                }
            } catch {
                call.resolve(["status": "error", "message": error.localizedDescription])
            }
        }
    }

    /// 購入の復元。App Storeと同期したうえで権利を確認する。
    @objc func restore(_ call: CAPPluginCall) {
        guard let productId = call.getString("productId") else {
            call.reject("productId is required")
            return
        }
        Task {
            do {
                try await AppStore.sync()
            } catch {
                // サインインのキャンセルや通信失敗でも、端末に既にある権利は確認する。
            }
            let purchased = await ownsProduct(productId)
            call.resolve(["purchased": purchased])
        }
    }

    // MARK: - Helpers

    private func ownsProduct(_ productId: String) async -> Bool {
        for await result in Transaction.currentEntitlements {
            if case .verified(let transaction) = result,
               transaction.productID == productId,
               transaction.revocationDate == nil {
                return true
            }
        }
        return false
    }
}
