import { VendureEntity, Asset, DeepPartial } from '@vendure/core';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class Page extends VendureEntity {
    constructor(input?: DeepPartial<Page>) {
        super(input);
    }

    @Column()
    title: string;

    @Column()
    slug: string;

    @Column('text')
    content: string;

    @ManyToOne(() => Asset, { nullable: true, eager: true })
    featuredImage: Asset;

    @Column({ default: false })
    isPublished: boolean;
}
