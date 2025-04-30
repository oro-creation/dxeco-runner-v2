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
  | Date
  | null;

/**
 * IT資産マスタ
 */
export type AdaptorAssetMaster = {
  /**
   * MDMツールデバイスIDフィールド
   */
  fieldMdmToolDeviceId: string;

  /**
   * カスタムフィールド一覧
   */
  fields: ReadonlyArray<AdaptorCustomField>;

  /**
   * アセット一覧
   */
  assets: ReadonlyArray<AdaptorAsset>;
};

export type AdaptorCustomField =
  & {
    /**
     * コード
     */
    code: string;

    /**
     * 名前
     */
    name: string;
  }
  & (
    | {
      /**
       * 種類
       */
      type:
        | "Text"
        | "MultipleText"
        | "Date"
        | "DateSpan"
        | "Number"
        | "MemberEmail"
        | "Email"
        | "Currency";
    }
    | {
      /**
       * 種類
       */
      type: "Option";

      /**
       * 選択肢
       */
      options: string[];
    }
    | {
      /**
       * 種類
       */
      type: "Status";

      /**
       * ステータス一覧
       */
      statuses: CustomFieldStatus[];
    }
    | {
      type: "DueDate";
      /**
       * 警告表示前日数
       */
      numberOfDaysBeforeWarning: number;
    }
  );

export type CustomFieldStatus = {
  /**
   * コード
   */
  code: string;

  /**
   * ステータス名
   */
  name: string;

  /**
   * 色
   */
  color?: string;
};

/**
 * IT資産
 */
export type AdaptorAsset<
  Values extends Record<string, unknown> = Record<string, unknown>,
> = {
  /**
   * 識別子
   */
  identifier: string;

  /**
   * メールアドレス
   */
  email?: string;

  /**
   * カスタムフィールド
   */
  values: Values;
};

export type CustomFieldToTsType<T extends AdaptorCustomField> = T extends
  { type: "Text" | "MultipleText" | "MemberEmail" | "Email" } ? string
  : T extends { type: "Date" | "DateSpan" | "DueDate" } ? Date
  : T extends { type: "Currency" | "Number" } ? number
  : T extends {
    type: "Option";
    options: ReadonlyArray<infer O extends string>;
  } ? O
  : T extends {
    type: "Status";
    statuses: ReadonlyArray<infer S extends CustomFieldStatus>;
  } ? S["code"]
  : never;
