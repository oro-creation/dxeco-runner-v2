# dxeco-runner-v2

## 起動方法(開発時)

```sh
deno task dev
```

[.github/workflows/release.yml](.github/workflows/release.yml) のGitHub
ActionsのワークフローによりReleaseを作成すると対応しているOSごとの実行ファイルが生成されReleaseに添付されます

## 実行

https://github.com/oro-creation/dxeco-runner-v2/releases
から使用するOSに合ったものをダウンロードし実行することができます

ダウンロードしたファイルがあるディレクトリに移動しファイル名を `dxeco-runner`
にした場合

```sh
./dxeco-runner --name RunnerName --api-key apiKey
```

必要なパラメーターが不足している場合は、指定できるパラメーター一覧が表示されます

## 権限を指定しての実行例 (Denoのインストールが必要です)

```sh
deno run --allow-net=api.dxeco.io --allow-env=DENO_DIR,HOME,DENO_AUTH_TOKENS --allow-read=/Users/narumi/Library/Caches/deno,'/Users/narumi/Library/Application Support/deno-wasmbuild' https://raw.githubusercontent.com/oro-creation/dxeco-runner-v2/main/cli.ts --name RunnerName --api-key apiKey
```

環境変数 `DENO_DIR` や　ファイル `deno-wasmbuild` などへのアクセスは TypeScript
から JavaScript へバンドルする際に使用する
[emit](https://github.com/denoland/deno_emit) が必要なためです.
またOSによって読み取るファイルのパスが異なります

また権限が必要になったタイミングで権限を許可するかの聞かれます. y
と答えることで許可をすることができます
