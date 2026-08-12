/**
 * RFC Store — Checkout Loading
 */
import { Container } from "@/components/ui/Container";
import { CheckoutSkeleton } from "@/components/checkout";

export default function CheckoutLoading() {
  return (
    <Container>
      <CheckoutSkeleton />
    </Container>
  );
}
