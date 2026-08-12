/**
 * RFC Store — Cart Page Loading State
 */
import { Container } from "@/components/ui/Container";
import { CartSkeleton } from "@/components/cart";

export default function CartLoading() {
  return (
    <Container>
      <CartSkeleton />
    </Container>
  );
}
