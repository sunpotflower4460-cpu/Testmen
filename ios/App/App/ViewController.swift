import UIKit
import Capacitor

/// Main.storyboard のルート。アプリ内に置いたローカルプラグインをCapacitorへ登録する。
class ViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(StampPurchasesPlugin())
    }
}
