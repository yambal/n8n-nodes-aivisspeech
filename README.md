# n8n-nodes-aivisspeech

English | [日本語](README.ja.md)

This is an n8n community node. It lets you use [AivisSpeech](https://github.com/Aivis-Project/AivisSpeech) (VOICEVOX-compatible) text-to-speech synthesis in your n8n workflows.

AivisSpeech is a high-quality Japanese text-to-speech engine with VOICEVOX-compatible API.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Credentials](#credentials)
[Compatibility](#compatibility)
[Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

### Community Nodes (Recommended)

1. Go to **Settings > Community Nodes**
2. Select **Install**
3. Enter `n8n-nodes-aivisspeech`
4. Select **Install**

### Manual Installation

```bash
cd ~/.n8n/custom
npm init -y
npm install n8n-nodes-aivisspeech
```

## Operations

### Speech Synthesis

| Operation | Description |
|-----------|-------------|
| **Get Speakers** | List available speakers and their voice styles |
| **Synthesize (Simple)** | Convert text to speech (auto 2-step: AudioQuery + Synthesis) |
| **Get AudioQuery** | Get AudioQuery (pronunciation/accent info) from text |
| **Synthesize from AudioQuery** | Synthesize speech from AudioQuery JSON |

### User Dictionary

| Operation | Description |
|-----------|-------------|
| **Get User Dictionary** | List all words in user dictionary |
| **Add Word** | Add a word to user dictionary |
| **Update Word** | Update an existing word in user dictionary |
| **Delete Word** | Delete a word from user dictionary |

## Credentials

To use this node, you need to configure the AivisSpeech API credentials:

| Field | Description | Default |
|-------|-------------|---------|
| **Base URL** | AivisSpeech engine URL | `http://localhost:10101` |

**Docker users**: Use `http://host.docker.internal:10101` if AivisSpeech runs on your host machine.

## Compatibility

- **n8n version**: 1.0.0 or later
- **AivisSpeech**: Any version with VOICEVOX-compatible API
- **VOICEVOX**: Compatible with VOICEVOX Engine API

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
* [AivisSpeech GitHub](https://github.com/Aivis-Project/AivisSpeech)
* [VOICEVOX API Reference](https://voicevox.github.io/voicevox_engine/api/)

## Changelog

### 0.4.8

- Changed: `intonationScale` label renamed from "抑揚" to "感情表現" to match AivisSpeech API semantics
- Added: min/max values to all parameter descriptions
- Added: JSON input hint with formatted full-set example below input field

### 0.4.7

- Added: `pauseLength` and `tempoDynamicsScale` parameters to all synthesis operations
- Added: full-set JSON sample in multi-text synthesis JSON input default
- Fixed: JSON input mode now correctly parses string input (`jsonInput.map is not a function`)

### 0.4.6

- Changed: simple synthesis audio params (speed, pitch, intonation, volume, silence) now use optional "Add Field" collection
- Changed: multi-text synthesis base params display names prefixed with "ベース" for clarity
- Removed: sampling rate parameter (uses API default)

### 0.4.5

- Changed: multi-text synthesis base audio params (speed, pitch, intonation, volume, silence) now use optional "Add Field" collection instead of always-visible fields
- Changed: per-text speaker ID moved into optional overrides collection (removed -1 sentinel)
- Changed: JSON input mode now supports all per-text override fields
- Improved: parameter priority for multi-text synthesis: per-text > base collection > API default

### 0.4.4

- Added: per-text AudioQuery parameter overrides (speed, pitch, intonation, volume, silence) for multi-text synthesis

### 0.4.3

- Added: multi-text synthesis operation (combine multiple texts into one audio via `/connect_waves`)
- Added: per-text speaker ID and silence overrides for multi-text synthesis
- Added: GUI and JSON input modes for multi-text synthesis
- Fixed: binary property name now correctly sets the output key (not filename)

### 0.4.2

- Added: AudioQuery parameters (speed, pitch, intonation, volume, silence, sampling rate, stereo) to simple synthesis
- Updated: official AivisSpeech icon

### 0.4.1

- Changed: speech synthesis now outputs binary data instead of saving files to disk
- Removed: `outputDir` parameter (no longer needed)

### 0.4.0

- Refactored: split monolithic node into modular file structure for better maintainability

### 0.3.1

- Added: user dictionary operations (Get / Add / Update / Delete)
- Improved: UI labels and descriptions in Japanese

### 0.1.0

- Initial release
- Speech synthesis operations (Get Speakers, Synthesize, AudioQuery, Synthesize from AudioQuery)

## License

[MIT](LICENSE)
