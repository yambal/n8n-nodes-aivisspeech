import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

const FORMAT_GUIDE = `# AivisSpeech 音声合成 JSON 生成ガイド

あなたはテキストを音声合成するための JSON 配列を生成してください。
この JSON は AivisSpeech の複数テキスト音声合成（multiSynthesis）の入力として使用されます。
各要素が1つの音声セグメントに対応し、順番に合成・連結されて1つの音声ファイルになります。

## 出力フォーマット

JSON 配列を出力してください。各要素は以下の構造です。

\`\`\`json
[
  {
    "text": "合成するテキスト（必須）",
    "speakerId": 888753760,
    "speedScale": 1.0,
    "pitchScale": 0.0,
    "intonationScale": 1.0,
    "volumeScale": 1.0,
    "prePhonemeLength": 0.1,
    "postPhonemeLength": 0.1,
    "tempoDynamicsScale": 1.0
  }
]
\`\`\`

- \`text\` のみ必須です。他のフィールドはすべてオプションで、省略時はベース設定値が使用されます。
- 変更が不要なフィールドは省略してください（冗長な指定は避ける）。

## フィールド一覧

| フィールド | 型 | 範囲 | デフォルト | 説明 |
|---|---|---|---|---|
| text | string | — | — | 合成するテキスト（必須） |
| speakerId | number | — | ベース値 | 話者ID。会話形式で話者を切り替える場合に指定 |
| speedScale | number | 0.5〜2.0 | 1.0 | 話速 |
| pitchScale | number | -0.15〜0.15 | 0.0 | 音高。**0.0以外は音質が劣化するため、原則として指定しないこと** |
| intonationScale | number | 0.0〜2.0 | 1.0 | 感情表現の強さ。1.0超は非線形に増幅される |
| volumeScale | number | 0.0〜2.0 | 1.0 | 音量 |
| prePhonemeLength | number | 0.0〜1.5 | 0.1 | セグメント開始前の無音（秒） |
| postPhonemeLength | number | 0.0〜1.5 | 0.1 | セグメント終了後の無音（秒） |
| tempoDynamicsScale | number | 0.0〜2.0 | 1.0 | テンポの緩急。高いほど人間らしい発話リズム |

## パラメータ調整の指針

### speedScale（話速）
- 0.8〜0.9: ゆっくり丁寧に伝えたい部分
- 1.0: 標準
- 1.1〜1.3: テンポよく伝えたい部分

### pitchScale（音高）
- **常に 0.0 のまま使用すること。指定しないこと。**
- AivisSpeech では音高変更は後処理で行われるため、0.0 以外は必ず音質が劣化する

### intonationScale（感情表現の強さ）
- 0.5〜0.8: 控えめな感情（落ち着いたナレーション）
- 1.0: 標準
- 1.1〜1.3: やや強い感情（強調したい場面）
- 1.3超: 話者やスタイルによっては棒読みや発声崩壊のリスクあり
- 「ノーマル」スタイルでは効果なし
- **注意**: 1.0〜2.0 は内部的に 1.0〜10.0 に非線形マッピングされるため、1.5 でも内部値は 5.5 相当

### tempoDynamicsScale（テンポの緩急）
- 1.2〜1.5 が自然な発話リズムのスイートスポット
- 高くすると全体的にやや速くなる傾向あり。speedScale を少し下げて補償するとよい
- 0.0 にすると完全に均等なテンポ（機械的な印象）

### prePhonemeLength / postPhonemeLength（開始無音 / 終了無音）
- 0.0: 無音なし（セグメント間を詰めたい場合）
- 0.1: 標準
- 0.2〜0.5: 間を持たせたい場合（話題の転換、ドラマチックな間など）

### volumeScale（音量）
- 通常は指定不要（1.0）
- 1.5 超はクリッピング（音割れ）のリスクあり

## 危険な組み合わせ（避けるべき）

- pitchScale ≠ 0.0 → 音質劣化
- intonationScale > 1.5 → 棒読み・発声崩壊のリスク
- tempoDynamicsScale > 1.5 かつ speedScale > 1.3 → 速すぎて聞き取り困難
- intonationScale > 1.3 かつ tempoDynamicsScale > 1.5 → 表現過多で音声崩壊

## テキスト作成のコツ

- 適切な句読点を使うこと（モデルは句読点から韻律やポーズを推定する）
- 「？」をつけると疑問文の上昇イントネーションが自動適用される
- 長い文は短い文に分割すると、より正確な韻律が生成される
- 1つのセグメントは1〜2文程度が理想的

## 出力例

\`\`\`json
[
  {
    "text": "皆さん、こんにちは。"
  },
  {
    "text": "今日は、AivisSpeechのパラメータ設定について解説します。",
    "speedScale": 0.9,
    "tempoDynamicsScale": 1.3
  },
  {
    "text": "まず最も重要なのは、テンポの緩急です。",
    "intonationScale": 1.1,
    "prePhonemeLength": 0.3
  },
  {
    "text": "1.2から1.5の範囲に設定すると、自然な発話リズムが得られます。",
    "tempoDynamicsScale": 1.4
  },
  {
    "text": "ぜひ試してみてください。",
    "speedScale": 0.85,
    "postPhonemeLength": 0.3
  }
]
\`\`\``;

export async function getFormatGuide(
	_executeFunctions: IExecuteFunctions,
	_baseUrl: string,
	_itemIndex: number,
): Promise<INodeExecutionData> {
	return { json: { formatGuide: FORMAT_GUIDE } };
}
