# Solana Blockchain Integration Setup

This application now uses **real Solana blockchain operations** via @solana/web3.js.

## Current Configuration

- **Network**: Solana Devnet (for testing)
- **RPC Endpoint**: `https://api.devnet.solana.com`
- **Explorer**: https://explorer.solana.com/?cluster=devnet

## Requirements

### 1. Wallet with SOL Balance

Users need SOL for transaction fees:
- **Token Launch**: ~0.01 SOL
- **Airdrop**: ~0.001 SOL per recipient

### 2. Get Devnet SOL (Test Tokens)

Users can get free devnet SOL at:
- https://faucet.solana.com/
- Or via CLI: `solana airdrop 1 <YOUR_WALLET_ADDRESS> --url devnet`

## How It Works

### Token Launch Flow

1. User connects wallet via 12-word seed phrase
2. Seed phrase is stored securely in database
3. On token launch:
   - Edge function derives Keypair from seed phrase
   - Creates SPL token mint on Solana devnet
   - Mints initial supply to user's token account
   - Stores mint address in database
   - Returns explorer link

### Airdrop Flow

1. User provides token mint address and recipient list
2. Edge function:
   - Derives Keypair from stored seed phrase
   - Validates token mint and recipient addresses
   - Performs token transfers to each recipient
   - Logs success/failure per recipient
   - Updates database with transaction signatures

## Security Considerations

### Current Implementation (Devnet Testing)

✅ **Secure for testing:**
- Seed phrases encrypted in database
- RLS policies protect user data
- JWT authentication on all functions

⚠️ **NOT production-ready:**
- Simplified seed phrase derivation (uses SHA-256 hash)
- Should use BIP39/BIP44 standards for production
- Consider hardware wallet integration

### Production Recommendations

For mainnet deployment:

1. **Use BIP39/BIP44 Standard**
   ```typescript
   import * as bip39 from 'bip39';
   import { derivePath } from 'ed25519-hd-key';
   
   const seed = await bip39.mnemonicToSeed(seedPhrase);
   const path = "m/44'/501'/0'/0'"; // Solana derivation path
   const derivedSeed = derivePath(path, seed.toString('hex')).key;
   const keypair = Keypair.fromSeed(derivedSeed);
   ```

2. **Consider Custodial Solutions**
   - Use wallet adapters instead of storing seed phrases
   - Integrate with Phantom, Solflare, etc.
   - Let users sign transactions in their own wallets

3. **Add Transaction Limits**
   - Rate limiting on token launches
   - Maximum airdrop size limits
   - Spending limits per time period

4. **Enable Production RPC**
   - Use paid RPC providers (QuickNode, Helius, Alchemy)
   - Set via `SOLANA_RPC_URL` environment variable
   - Better reliability and rate limits

## Environment Variables

Add to your edge function secrets:

```bash
SOLANA_RPC_URL=https://api.devnet.solana.com  # or mainnet-beta for production
```

## Testing Your Integration

### 1. Connect Wallet
- Use the wallet connection form
- Enter a 12-word seed phrase (or generate one)

### 2. Fund Your Wallet
```bash
# Get your wallet address from the app
# Then airdrop devnet SOL
solana airdrop 1 <YOUR_ADDRESS> --url devnet
```

### 3. Launch a Token
- Go to Launch Token page
- Fill in token details
- Submit (requires ~0.01 SOL)
- Check transaction on explorer

### 4. Test Airdrop
- Copy your token's mint address
- Add recipient addresses
- Process airdrop
- Verify transfers on explorer

## Troubleshooting

### "Insufficient SOL balance"
- Get more devnet SOL from faucet
- Check balance: `solana balance <ADDRESS> --url devnet`

### "Invalid token address"
- Ensure mint address is valid Solana address
- Must be 44 characters (base58 encoded)

### "Transfer failed"
- Check recipient addresses are valid
- Ensure sender has enough tokens
- Verify token accounts exist

### Rate Limits
- Public RPC has rate limits
- Consider paid RPC for production
- Add delays between batch operations

## Mainnet Migration

To switch to mainnet:

1. Update RPC URL environment variable
2. Test thoroughly on devnet first
3. Ensure proper wallet security
4. Implement transaction signing flow
5. Add comprehensive error handling
6. Set up monitoring and alerts

## Resources

- [Solana Web3.js Docs](https://solana-labs.github.io/solana-web3.js/)
- [SPL Token Program](https://spl.solana.com/token)
- [Solana Cookbook](https://solanacookbook.com/)
- [Solana Explorer](https://explorer.solana.com/)
