export type AccountType = "Default" | "NoCharge";

export type AdaptorAccount = {
  /**
   * 識別子
   */
  identifier?: string;

  /**
   * 名前
   */
  name?: string;

  /**
   * メールアドレス
   */
  email?: string;

  /**
   * サブメールアドレス一覧
   */
  subemails?: string[];

  /**
   * 画像URL
   */
  image?: string;

  /**
   * アカウントタイプ
   */
  type?: AccountType;

  /**
   * 最終アクティブ日時
   */
  lastActiveAt?: Date;

  /**
   * メモ
   */
  memo?: string;

  /**
   * タグ名一覧
   */
  tagNames?: string[];
};
