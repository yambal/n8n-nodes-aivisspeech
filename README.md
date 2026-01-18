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

## License

[MIT](LICENSE)
