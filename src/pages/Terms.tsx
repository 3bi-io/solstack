import { TelegramNavigation } from "@/components/TelegramNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, FileText } from "lucide-react";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl">Terms of Service</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Last updated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-6 text-sm">
                {/* Introduction */}
                <section>
                  <h2 className="text-lg font-semibold mb-3">1. Introduction</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Welcome to ProTools Bundler Bot. By accessing or using our platform, you agree to be bound by these
                    Terms of Service. Please read them carefully before using our services.
                  </p>
                </section>

                {/* Platform Fees */}
                <section>
                  <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    2. Platform Fees
                  </h2>
                  <div className="space-y-3">
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <p className="font-semibold text-primary mb-2">Transaction Fee</p>
                      <p className="text-muted-foreground leading-relaxed">
                        ProTools Bundler Bot is a <strong className="text-foreground">free</strong> Platform.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Use of Service */}
                <section>
                  <h2 className="text-lg font-semibold mb-3">3. Use of Service</h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">By using ProTools Bundler Bot, you agree to:</p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>Provide accurate and complete information when connecting your wallet</li>
                    <li>Maintain the security of your wallet credentials and recovery phrases</li>
                    <li>Comply with all applicable laws and regulations regarding cryptocurrency transactions</li>
                    <li>Not use the service for any illegal or unauthorized purposes</li>
                    <li>Accept that all transactions are final and irreversible once confirmed on the blockchain</li>
                  </ul>
                </section>

                {/* Wallet Security */}
                <section>
                  <h2 className="text-lg font-semibold mb-3">4. Wallet Security</h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    Your wallet security is your responsibility. ProTools Bundler Bot:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>Does not store your private keys or recovery phrases in plain text</li>
                    <li>Uses encryption to protect sensitive wallet information</li>
                    <li>Never asks for your private keys through email, chat, or any other medium</li>
                    <li>Is not responsible for losses due to compromised wallet credentials</li>
                  </ul>
                </section>

                {/* Blockchain Transactions */}
                <section>
                  <h2 className="text-lg font-semibold mb-3">5. Blockchain Transactions</h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    All transactions on ProTools Bundler Bot are processed on the Solana blockchain:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>Transactions are irreversible once confirmed on the blockchain</li>
                    <li>Network fees (gas fees) are separate from platform fees</li>
                    <li>Transaction speed depends on network conditions</li>
                    <li>You are responsible for ensuring sufficient SOL balance for transaction fees</li>
                  </ul>
                </section>

                {/* Disclaimer */}
                <section>
                  <h2 className="text-lg font-semibold mb-3">6. Disclaimer</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    ProTools Bundler Bot is provided "as is" without warranties of any kind. We do not guarantee
                    uninterrupted access, error-free operation, or that the service will meet your specific
                    requirements. Cryptocurrency transactions carry inherent risks, and you should only use funds you
                    can afford to lose.
                  </p>
                </section>

                {/* Limitation of Liability */}
                <section>
                  <h2 className="text-lg font-semibold mb-3">7. Limitation of Liability</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    ProTools Bundler Bot shall not be liable for any indirect, incidental, special, consequential, or
                    punitive damages resulting from your use or inability to use the service, including but not limited
                    to loss of funds, loss of data, or loss of profits.
                  </p>
                </section>

                {/* Changes to Terms */}
                <section>
                  <h2 className="text-lg font-semibold mb-3">8. Changes to Terms</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We reserve the right to modify these Terms of Service at any time. Changes will be effective
                    immediately upon posting to the platform. Your continued use of ProTools Bundler Bot after changes are
                    posted constitutes acceptance of the modified terms.
                  </p>
                </section>

                {/* Contact */}
                <section>
                  <h2 className="text-lg font-semibold mb-3">9. Contact Information</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    If you have questions about these Terms of Service, please contact us through the Help section of
                    the platform.
                  </p>
                </section>

                {/* Acceptance */}
                <section className="pt-4 border-t">
                  <p className="text-muted-foreground leading-relaxed">
                    By using ProTools Bundler Bot, you acknowledge that you have read, understood, and agree to be bound by
                    these Terms of Service.
                  </p>
                </section>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      <TelegramNavigation />
    </div>
  );
};

export default Terms;
