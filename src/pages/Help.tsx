import { TelegramNavigation } from "@/components/TelegramNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const Help = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <HelpCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl">Help & FAQ</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Get answers to common questions
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-sm">What is this bundler?</AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-muted-foreground">
                  A Telegram bot that helps you manage crypto transactions, token launches, and airdrops efficiently.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-sm">How do I connect my wallet?</AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-muted-foreground">
                  Go to the Wallet section and click "Connect Wallet" to link your crypto wallet.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-sm">Is it secure?</AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-muted-foreground">
                  Yes, all connections are encrypted and we never store your private keys.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
      <TelegramNavigation />
    </div>
  );
};

export default Help;
