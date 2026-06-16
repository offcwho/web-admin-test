'use client';
import { RequireAuth, ResourcePage } from '@/adminkit';
import { productResource } from '@/resources/products';

export default function ProductsPage() {
  return (
    <RequireAuth role="admin">
      <ResourcePage resource={productResource} />
    </RequireAuth>
  );
}
