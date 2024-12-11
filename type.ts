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

export type AdaptorMember = {
  /**
   * 識別子
   */
  identifier?: string;

  /**
   * 社員番号
   */
  code?: string;

  /**
   * 名前
   */
  name?: string;

  /**
   * 部署
   */
  department?: string;

  /**
   * 役職
   */
  position?: string;

  /**
   * メールアドレス
   */
  email?: string;

  /**
   * サブメールアドレス一覧
   */
  subemails?: string[];

  /**
   * 画像
   */
  image?: string;

  /**
   * タグ名一覧
   */
  tagNames?: string[];

  /**
   * カスタムフィールド一覧
   */
  values?: Record<string, CustomFieldValue>;
};

export type CustomFieldValue =
  | string
  | number
  | null;
