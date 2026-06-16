'use client';
import { RequireAuth, ResourcePage } from '@/adminkit';
import { ordersResource } from '@/resources/orders';

export default function OrdersPage() {
  return (
    <RequireAuth role="admin">
      <ResourcePage resource={ordersResource} />
    </RequireAuth>
  );
}
