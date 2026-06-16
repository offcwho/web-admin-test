'use client'

import { RequireAuth, ResourcePage } from "@/adminkit";
import { categoriesResource } from "@/resources/categories";

export default function CategoriesPage() {
    return (
        <RequireAuth role="admin">
            <ResourcePage resource={categoriesResource} />
        </RequireAuth>
    )
}