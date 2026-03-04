import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { useSubscribeNewsletter } from "../hooks/useQueries";

interface NewsletterFormProps {
  placeholder?: string;
}

export default function NewsletterForm({
  placeholder = "your@email.com",
}: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const { mutate, isPending, isSuccess, isError } = useSubscribeNewsletter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    mutate(email.trim());
  };

  if (isSuccess) {
    return (
      <div
        data-ocid="newsletter.success_state"
        className="flex flex-col items-center gap-3 py-4 text-center"
      >
        <CheckCircle className="text-primary" size={32} />
        <p className="font-display text-lg font-medium text-foreground">
          You're in the field now.
        </p>
        <p className="text-sm text-muted-foreground">
          Occasional dispatches will find their way to you.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          type="email"
          placeholder={placeholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          data-ocid="newsletter.input"
          className="flex-1 bg-background border-border text-foreground placeholder:text-muted-foreground focus:ring-primary"
          aria-label="Email address"
        />
        <Button
          type="submit"
          disabled={isPending}
          data-ocid="newsletter.submit_button"
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 font-medium tracking-wide"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Subscribing...
            </>
          ) : (
            "Subscribe"
          )}
        </Button>
      </div>

      {isError && (
        <div
          data-ocid="newsletter.error_state"
          className="flex items-center gap-2 text-sm text-destructive"
        >
          <AlertCircle size={14} />
          <span>Something went wrong. Please try again.</span>
        </div>
      )}
    </form>
  );
}
