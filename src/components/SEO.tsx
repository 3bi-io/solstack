import { Helmet } from "react-helmet";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
  structuredData?: any;
  noindex?: boolean;
}

export const SEO = ({
  title = "SOL Stack - AI-Powered Solana DeFi Platform",
  description = "Experience the cutting edge of AI-driven Solana trading. Revolutionary token launches, intelligent market analysis, and automated DeFi strategies powered by advanced machine learning.",
  keywords = "Solana, DeFi, AI trading, token launch, airdrop platform, crypto, blockchain, Jupiter aggregator, pump.fun alternative, Solana bundler, crypto analytics",
  image = "https://storage.googleapis.com/gpt-engineer-file-uploads/W1hSv6TZsaSmimtDCBPaJhIlFNp2/social-images/social-1760261657684-IMG_0577.jpeg",
  url = "https://solstack.me",
  type = "website",
  article,
  structuredData,
  noindex = false,
}: SEOProps) => {
  const baseUrl = "https://solstack.me";
  const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;
  const fullTitle = title.includes("SOL Stack") ? title : `${title} | SOL Stack`;

  // Default Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SOL Stack",
    description: "First Ever AI-Powered Solana DeFi Platform",
    url: baseUrl,
    logo: "https://storage.googleapis.com/gpt-engineer-file-uploads/W1hSv6TZsaSmimtDCBPaJhIlFNp2/uploads/1759959540935-22CE5392-5406-4E88-81F3-E6306B47F69A.png",
    sameAs: [
      "https://twitter.com/SOLSTACK_me",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Support",
      url: `${baseUrl}/help`,
    },
  };

  // WebApplication Schema
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "SOL Stack",
    description: "AI-Powered Solana DeFi Platform for token launches, airdrops, and intelligent trading",
    url: baseUrl,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "AI Market Analysis",
      "Token Launch Platform",
      "Airdrop Distribution",
      "Multi-Wallet Transaction Bundling",
      "Jupiter DEX Integration",
      "Real-Time Market Data",
      "Solana Blockchain Integration",
    ],
  };

  // Combine all structured data
  const allStructuredData = [
    organizationSchema,
    webAppSchema,
    ...(structuredData ? [structuredData] : []),
  ];

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={fullUrl} />
      
      {/* Robots */}
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="SOL Stack" />
      
      {/* Article specific OG tags */}
      {article && type === "article" && (
        <>
          {article.publishedTime && (
            <meta property="article:published_time" content={article.publishedTime} />
          )}
          {article.modifiedTime && (
            <meta property="article:modified_time" content={article.modifiedTime} />
          )}
          {article.author && (
            <meta property="article:author" content={article.author} />
          )}
          {article.section && (
            <meta property="article:section" content={article.section} />
          )}
          {article.tags?.map((tag) => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@SOLSTACK_me" />
      <meta name="twitter:creator" content="@SOLSTACK_me" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Structured Data (JSON-LD) */}
      {allStructuredData.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};
