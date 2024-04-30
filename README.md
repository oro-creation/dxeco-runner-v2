# dxeco-runner-v2

## 起動方法(開発時)

```sh
deno task dev
```

## 実行

https://github.com/oro-creation/dxeco-runner-v2/releases
から使用するOSに合ったものをダウンロードし実行することができます

ダウンロードしたファイルがあるディレクトリに移動しファイル名を `dxeco-runner`
にした場合

```sh
./dxeco-runner --name RunnerName --api-key apiKey
```

必要なパラメーターが不足している場合は、指定できるパラメーター一覧が表示されます

## 権限を指定しての実行 (Denoのインストールが必要です)

```sh
deno run --allow-net=api.dxeco.io https://raw.githubusercontent.com/oro-creation/dxeco-runner-v2/main/cli.ts --name RunnerName --api-key apiKey
```
