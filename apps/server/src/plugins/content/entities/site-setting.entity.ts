import { VendureEntity, Asset, DeepPartial } from '@vendure/core';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class SiteSetting extends VendureEntity {
    constructor(input?: DeepPartial<SiteSetting>) {
        super(input);
    }

    @Column({ default: 'Himalayan Khukuri House' })
    siteName: string;

    @Column({ nullable: true })
    metaTitle: string;

    @Column({ type: 'text', nullable: true })
    metaDescription: string;

    @Column({ nullable: true })
    metaKeywords: string;

    @ManyToOne(() => Asset, { nullable: true, eager: true })
    logo: Asset;

    @ManyToOne(() => Asset, { nullable: true, eager: true })
    favicon: Asset;

    @Column({ nullable: true })
    facebookUrl: string;

    @Column({ nullable: true })
    instagramUrl: string;

    @Column({ nullable: true })
    tiktokUrl: string;

    @Column({ nullable: true })
    whatsappUrl: string;
}
