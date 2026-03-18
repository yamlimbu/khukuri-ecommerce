import { Component } from '@angular/core';
import { SharedModule } from '@vendure/admin-ui/core';

@Component({
    selector: 'custom-page',
    template: `
        <vdr-page-block>
            <h2>Hello from the Custom Plugin!</h2>
            <p>This is a custom page integrated into the Vendure Admin UI.</p>
        </vdr-page-block>
    `,
    standalone: true,
    imports: [SharedModule],
})
export class CustomPageComponent {}
