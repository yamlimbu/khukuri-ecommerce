import { Component, OnInit } from '@angular/core';
import { SharedModule } from '@vendure/admin-ui/core';

@Component({
    selector: 'app-pages',
    template: `
        <vdr-page-block>
            <vdr-page-title>
                <h2>Pages</h2>
            </vdr-page-title>
            <div class="content">
                <h3>Manage Dynamic Pages</h3>
                <p>This page allows you to manage dynamic page content for your store.</p>
                <p>Pages are integrated with your storefront for dynamic content delivery.</p>
                <!-- Add page management UI here -->
            </div>
        </vdr-page-block>
    `,
    styles: [`
        .content {
            padding: 20px;
        }
        h3 {
            margin-top: 20px;
            font-weight: 600;
        }
        p {
            margin: 10px 0;
            color: #666;
        }
    `],
    standalone: true,
    imports: [SharedModule],
})
export class PageComponent implements OnInit {
    ngOnInit() {
        // TODO: Fetch pages from your API
        console.log('Page component initialized');
    }
}
