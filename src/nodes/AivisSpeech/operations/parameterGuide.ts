import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

const FORMAT_GUIDE = `# AivisSpeech 音声合成 JSON 生成ガイド

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

const PARAMETER_GUIDE = `# AivisSpeech パラメータ設定ガイド

AivisSpeech (Style-Bert-VITS2 ベース) の AudioQuery パラメータについて、各項目の効果・推奨値・組み合わせのノウハウをまとめたドキュメントです。

---

## パラメータ一覧

| パラメータ | 説明 | 範囲 | デフォルト |
|---|---|---|---|
| speedScale | 話速 | 0.5 〜 2.0 | 1.0 |
| pitchScale | 音高 | -0.15 〜 0.15 | 0.0 |
| intonationScale | 感情表現の強さ | 0.0 〜 2.0 | 1.0 |
| tempoDynamicsScale | テンポの緩急 | 0.0 〜 2.0 | 1.0 |
| volumeScale | 音量 | 0.0 〜 2.0 | 1.0 |
| prePhonemeLength | 開始無音（秒） | 0.0 〜 1.5 | 0.1 |
| postPhonemeLength | 終了無音（秒） | 0.0 〜 1.5 | 0.1 |
| pauseLength | 句読点無音（秒） | float / null | null |
| outputStereo | ステレオ出力 | true / false | false |

---

## 各パラメータの詳細

### speedScale（話速）

音声合成後にタイムストレッチ処理で速度を変更します。

| 値 | 用途 |
|---|---|
| 0.8 〜 0.9 | 重要な情報、教育コンテンツ。聞き取りやすさ重視 |
| 1.0 | 標準。多くの場面に最適 |
| 1.1 〜 1.3 | 会話調、テンポの良い解説 |
| 1.5+ | プレビュー用途。自然さは低下 |

- 全範囲で品質劣化は比較的少ない（pitchScale と違い安全）
- 極端な値（0.5 付近や 2.0 付近）ではタイムストレッチによるアーティファクトが発生する可能性あり
- 文ごとに速度を変えると「メリハリ」が生まれ、聞き手の理解度が向上する

---

### pitchScale（音高）

⚠️ 0.0 以外にすると音質が劣化します

AivisSpeech では音声合成後に後付けでピッチシフトするため、VOICEVOX と異なり必ず音質が劣化します。公式ドキュメントにも明記されています。

| 値 | 品質への影響 |
|---|---|
| 0.0 | 常に推奨。品質劣化なし |
| ±0.05 以内 | 最小限の劣化。どうしても変える場合はこの範囲で |
| ±0.05 〜 ±0.10 | 聞き取れる劣化あり |
| ±0.10 超 | 顕著な劣化。避けるべき |

代替手段: ピッチを変えたい場合は、別の話者やスタイルを選ぶ方が高品質です。

---

### intonationScale（感情表現の強さ）

AivisSpeech 独自の意味を持つパラメータです。VOICEVOX の「抑揚」とは異なり、選択中のスタイルの感情表現の強さを制御します。

内部マッピング（非線形）:
- intonationScale 0.0 → style_weight 0.0
- intonationScale 1.0 → style_weight 1.0
- intonationScale 1.5 → style_weight 5.5
- intonationScale 2.0 → style_weight 10.0

1.0 を超えると急激に効果が強まります。

| 値 | 効果 |
|---|---|
| 0.0 | 感情なし。フラットな声 |
| 0.5 〜 0.8 | 控えめな感情。プロ向けナレーション |
| 1.0 | デフォルト。訓練時の標準強度 |
| 1.0 〜 1.3 | やや強い感情表現 |
| 1.3 〜 1.6 | 強い。話者/スタイルにより破綻リスクあり |
| 1.6+ | 非常に強い。棒読みや発声崩壊の可能性大 |

注意事項:
- 「ノーマル」スタイルではこのパラメータは無効です（全スタイルの平均であるため）
- 安全な上限は話者・スタイルごとに異なります
- 上げすぎると棒読み（モノトーン）になったり、発声がおかしくなる場合があります
- 0.1 刻みで段階的にテストすることを推奨します

---

### tempoDynamicsScale（テンポの緩急）

AivisSpeech 専用パラメータです（VOICEVOX にはありません）。文中の話速の揺らぎ（速くなったり遅くなったり）を制御し、人間らしい発話リズムを再現します。

内部マッピング（Style-Bert-VITS2 の SDP 比率）:
- tempoDynamicsScale 0.0 → SDP 比率 0.0（完全に均等なテンポ）
- tempoDynamicsScale 1.0 → SDP 比率 0.2（デフォルト）
- tempoDynamicsScale 2.0 → SDP 比率 1.0（最大の揺らぎ）

| 値 | 効果 |
|---|---|
| 0.0 | 完全に均等。ロボット的だが予測可能 |
| 0.5 〜 0.8 | 控えめな揺らぎ |
| 1.0 | デフォルト（控えめな緩急） |
| 1.2 〜 1.5 | 自然さのスイートスポット。会話・ナレーションに最適 |
| 1.5 〜 2.0 | 大きな緩急。カジュアル/感情的な場面に |

- 高くすると全体的に速くなる傾向があります。speedScale を少し下げて補償するとバランスが取れます
- 自然さ向上に最も効果的なパラメータです。まずこれを調整することを推奨します

---

### volumeScale（音量）

純粋なゲイン調整です。合成品質には影響しません。

| 値 | 用途 |
|---|---|
| 0.7 〜 0.9 | BGM とのミックス時に控えめにしたい場合 |
| 1.0 | デフォルト |
| 1.0 〜 1.2 | 単体ナレーション |
| 1.5+ | クリッピング（音割れ）のリスクあり |

- 本格的な音量調整は後処理（音声編集ソフト）で行う方が精密です
- 文ごとに微妙に変化させる（0.95〜1.05）と、均一すぎる印象を緩和できます

---

### prePhonemeLength / postPhonemeLength（開始無音 / 終了無音）

音声の前後に挿入される無音の長さ（秒）です。品質への影響はゼロで、自由に調整できます。

| 値 | 用途 |
|---|---|
| 0.0 | パディングなし。連結時にシームレスに繋げたい場合 |
| 0.1 | デフォルト。急な開始/終了を防ぐ |
| 0.15 〜 0.3 | ナレーション向け。文間に「間」を作る |
| 0.3 〜 0.5 | ドラマチックな間。トピック転換時 |

- speedScale の影響を受けません（速度を変えても無音の長さは一定）
- 複数音声を連結する場合は 0.0 にして、連結ロジック側で間隔を制御するのが最も精密です

---

### pauseLength（句読点無音）

⚠️ AivisSpeech Engine では実質的に無視されます

API スキーマには VOICEVOX 互換で存在しますが、AivisSpeech の Style-Bert-VITS2 モデルが句読点のポーズを自動決定するため、この値は効きません。

代替手段:
- テキスト内の句読点で制御（句点「。」は読点「、」より長いポーズ）
- 長い文を短い文に分割する
- 複数テキスト合成で prePhonemeLength / postPhonemeLength を活用する

---

## 推奨プリセット

### 自然な会話調
\`\`\`json
{
  "speedScale": 1.1,
  "pitchScale": 0.0,
  "intonationScale": 1.0,
  "tempoDynamicsScale": 1.3,
  "volumeScale": 1.0,
  "prePhonemeLength": 0.1,
  "postPhonemeLength": 0.1
}
\`\`\`
やや速めのペースと強めのテンポ緩急で、自然な会話感を再現します。

### プロフェッショナルなナレーション
\`\`\`json
{
  "speedScale": 0.9,
  "pitchScale": 0.0,
  "intonationScale": 0.8,
  "tempoDynamicsScale": 0.8,
  "volumeScale": 1.0,
  "prePhonemeLength": 0.15,
  "postPhonemeLength": 0.15
}
\`\`\`
ゆったりしたペースで、感情を控えめにした落ち着いた読み上げ。長めの無音パディングで重厚感を出します。

### 元気なキャラクター
\`\`\`json
{
  "speedScale": 1.2,
  "pitchScale": 0.0,
  "intonationScale": 1.3,
  "tempoDynamicsScale": 1.5,
  "volumeScale": 1.1,
  "prePhonemeLength": 0.05,
  "postPhonemeLength": 0.05
}
\`\`\`
速いペース、強い感情表現、大きなテンポ緩急でエネルギッシュな印象に。短い無音でテンポ感を維持します。

### 穏やかな朗読
\`\`\`json
{
  "speedScale": 0.85,
  "pitchScale": 0.0,
  "intonationScale": 0.6,
  "tempoDynamicsScale": 0.7,
  "volumeScale": 0.9,
  "prePhonemeLength": 0.2,
  "postPhonemeLength": 0.2
}
\`\`\`
ゆっくりしたペースで感情を抑え、テンポ変動も少なめ。やや小さい音量でやさしい印象を与えます。

---

## 危険な組み合わせ

| 組み合わせ | リスク |
|---|---|
| pitchScale ≠ 0.0（単体で） | 音質劣化（最大の品質キラー） |
| intonationScale > 1.5 | 棒読み化・発声崩壊（話者/スタイル依存） |
| 高 tempoDynamicsScale + 高 speedScale | 速すぎて聞き取り不能に |
| 高 intonationScale + 高 tempoDynamicsScale | 表現過多で音声崩壊 |

## 安全な組み合わせ

| 組み合わせ | 効果 |
|---|---|
| speedScale + tempoDynamicsScale を対で調整 | テンポ緩急を上げたら話速を少し下げて補償 |
| volumeScale の調整 | 純粋なゲインなので品質影響なし（ただし 1.5 超はクリッピング注意） |
| prePhonemeLength / postPhonemeLength | 単純な無音パディング。品質影響ゼロ |

---

## パラメータ調整ワークフロー

以下の順序で調整すると効率的です。

1. 全パラメータをデフォルトで開始
2. tempoDynamicsScale を 1.2〜1.4 に調整（自然さ向上の最も効果的な一手）
3. speedScale をコンテンツに合わせて調整
4. intonationScale でスタイルの感情強度を微調整（0.1 刻みでテスト）
5. pitchScale は触らない（別の話者/スタイルで対応）
6. prePhonemeLength / postPhonemeLength を連結方法に合わせて最後に調整

---

## テキスト側の工夫

パラメータ調整だけでなく、入力テキストの書き方も音声品質に大きく影響します。

- 適切な句読点を使う — Style-Bert-VITS2 モデルは句読点から韻律やポーズを推定します
- 「？」で疑問文の上昇イントネーションが自動的に適用されます
- 長い文は短い文に分割 — 文ごとにより正確な韻律が生成されます
- 文ごとに異なるスタイルを割り当て可能 — パラメータ調整なしで感情の変化を表現できます`;

const JSON_SCHEMA = {
	$schema: 'https://json-schema.org/draft/2020-12/schema',
	title: 'AivisSpeech MultiSynthesis TextItems',
	description: 'AivisSpeech 複数テキスト音声合成（multiSynthesis）の JSON 入力スキーマ',
	type: 'array',
	items: {
		type: 'object',
		required: ['text'],
		additionalProperties: false,
		properties: {
			text: {
				type: 'string',
				description: '合成するテキスト',
			},
			speakerId: {
				type: 'integer',
				description: '話者ID（省略時はベース話者IDを使用）',
			},
			speedScale: {
				type: 'number',
				description: '話速',
				minimum: 0.5,
				maximum: 2.0,
				default: 1.0,
			},
			pitchScale: {
				type: 'number',
				description: '音高（0.0以外は音質劣化）',
				minimum: -0.15,
				maximum: 0.15,
				default: 0.0,
			},
			intonationScale: {
				type: 'number',
				description: '感情表現の強さ（1.0超は非線形に増幅、上げすぎると破綻）',
				minimum: 0.0,
				maximum: 2.0,
				default: 1.0,
			},
			volumeScale: {
				type: 'number',
				description: '音量（1.5超はクリッピングのリスク）',
				minimum: 0.0,
				maximum: 2.0,
				default: 1.0,
			},
			prePhonemeLength: {
				type: 'number',
				description: '開始無音（秒）',
				minimum: 0.0,
				maximum: 1.5,
				default: 0.1,
			},
			postPhonemeLength: {
				type: 'number',
				description: '終了無音（秒）',
				minimum: 0.0,
				maximum: 1.5,
				default: 0.1,
			},
			pauseLength: {
				type: ['number', 'null'],
				description: '句読点無音（秒）（AivisSpeechでは無視される）',
				default: null,
			},
			tempoDynamicsScale: {
				type: 'number',
				description: 'テンポの緩急（AivisSpeech専用、自然さ向上には1.2〜1.5が効果的）',
				minimum: 0.0,
				maximum: 2.0,
				default: 1.0,
			},
		},
	},
	examples: [
		[
			{ text: 'こんにちは、今日はいい天気ですね。' },
			{
				text: 'それでは、本題に入りましょう。',
				speedScale: 0.9,
				tempoDynamicsScale: 1.3,
			},
			{
				text: 'これはとても重要なポイントです！',
				speakerId: 888753760,
				intonationScale: 1.2,
				prePhonemeLength: 0.3,
			},
		],
	],
};

export async function getParameterGuide(
	_executeFunctions: IExecuteFunctions,
	_baseUrl: string,
	_itemIndex: number,
): Promise<INodeExecutionData> {
	return {
		json: {
			parameterGuide: PARAMETER_GUIDE,
			formatGuide: FORMAT_GUIDE,
			jsonSchema: JSON_SCHEMA,
		},
	};
}
