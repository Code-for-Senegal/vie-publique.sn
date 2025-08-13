# Vie Publique Sénégal

## Overview

Vie Publique Sénégal is a platform dedicated to providing transparent access to public information in Senegal. This project aims to make government data and public information easily accessible to citizens.

## Features

- **News Section**: Access to the latest news and updates
- **Official Documents**: Browse through official documents, laws, and decrees
- **National Assembly**: Information about the National Assembly
- **Council of Ministers**: Access to council of ministers' communiqués
- **Budget**: Information about Senegal's budget
- **Directory**: Access to various public institutions and resources
- **Elections**: Information about elections

## Social Networks

Follow us on our social networks to stay updated:

- [LinkedIn](https://www.linkedin.com/company/vie-publique-sn) - 33K followers
- [Facebook](https://www.facebook.com/ViePubliqueSenegal) - 16K followers
- [Instagram](https://www.instagram.com/viepubliquesn) - 500 followers
- [Twitter/X](https://x.com/ViePubliqueSN) - 14K followers

## Technical Stack

- **Frontend**: Nuxt.js 3
- **UI Framework**: Nuxt UI
- **State Management**: Pinia
- **Styling**: Tailwind CSS
- **API**: Directus

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Docker (for local development)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/vie-publique-senegal.git
cd vie-publique-senegal
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env` file based on `.env.example` and fill in the required environment variables.

4. Start the development server:

**For Linux/macOS:**

```bash
npm run dev
# or
yarn dev
```

**For Windows PowerShell:**

```bash
npm run dev-win
# or
yarn dev-win
```

## Development

### Available Scripts

- `npm run dev` - Start development server (Linux/macOS)
- `npm run dev-win` - Start development server (Windows PowerShell)
- `npm run build` - Build for production
- `npm run generate` - Generate static project
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier

### Cross-Platform Development

The project includes separate scripts for different operating systems to handle PDF worker file copying:

- **Linux/macOS**: Uses Unix commands (`mkdir -p`, `cp`)
- **Windows**: Uses PowerShell commands (`if not exist`, `mkdir`, `copy`)

## Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
