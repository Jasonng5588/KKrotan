const fs = require('fs');
const path = require('path');

const adminDir = path.join(__dirname, 'src', 'app', 'admin');
const subDirs = ['banners', 'categories', 'customers', 'orders', 'products', 'quotes', 'reviews', 'vouchers'];

const authSnippet = `
    const { cookies } = require('next/headers')
    const isAdmin = cookies().get('kkrotan_admin_session')?.value === 'kkrotan_admin_authenticated_2026'
    if (!isAdmin) redirect('/admin/login')
`;

subDirs.forEach(dir => {
    const pagePath = path.join(adminDir, dir, 'page.tsx');
    if (fs.existsSync(pagePath)) {
        let content = fs.readFileSync(pagePath, 'utf8');

        if (!content.includes('import { redirect } from')) {
            content = "import { redirect } from 'next/navigation'\n" + content;
        }

        const functionRegex = /export default async function \w+\(.*\) \{/;
        content = content.replace(functionRegex, match => {
            return match + '\n' + authSnippet;
        });

        fs.writeFileSync(pagePath, content);
        console.log('Patched ' + dir);
    }
});

const dashPath = path.join(adminDir, 'page.tsx');
let dashContent = fs.readFileSync(dashPath, 'utf8');
if (!dashContent.includes('import { redirect } from')) {
    dashContent = "import { redirect } from 'next/navigation'\n" + dashContent;
}
dashContent = dashContent.replace(/export default async function AdminDashboard\(\) \{/, match => match + '\n' + authSnippet);
fs.writeFileSync(dashPath, dashContent);
console.log('Patched dashboard');
