import { useSyncExternalStore } from 'react'
import { getLanguageSetting, lang, subscribeLanguage } from './i18n'

/**
 * 表示言語と設定値を返し、切り替わったら呼び出したコンポーネントを描き直す。
 * App で呼ぶことで、その下の画面すべてが新しい言語になる。
 */
export function useLanguage() {
  const current = useSyncExternalStore(subscribeLanguage, () => lang)
  const setting = useSyncExternalStore(subscribeLanguage, getLanguageSetting)
  return { lang: current, setting }
}
