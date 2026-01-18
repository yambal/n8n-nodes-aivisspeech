# n8n-nodes-aivisspeech

n8n community node for [AivisSpeech](https://github.com/Aivis-Project/AivisSpeech) (VOICEVOX-compatible) text-to-speech synthesis.

## Features

- **Get Speakers** - List available speakers and their voice styles
- **Synthesize** - Convert text to speech and save as WAV file

## Installation

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

## Configuration

1. Create new credentials for **AivisSpeech API**
2. Set the **Base URL** (default: `http://localhost:10101`)
   - For Docker: use `http://host.docker.internal:10101`

## Operations

### Get Speakers

Returns a list of available speakers with their styles and IDs.

### Synthesize

Converts text to speech audio.

**Parameters:**
- **Text** (required): The text to synthesize
- **Speaker ID** (required): The speaker's style ID (get from "Get Speakers")
- **Output Directory**: Where to save the WAV file (default: `/workspace/tts`)
- **Filename**: Output filename (auto-generated if empty)

## Requirements

- AivisSpeech or VOICEVOX Engine running and accessible
- n8n v1.0.0 or later

## License

MIT
