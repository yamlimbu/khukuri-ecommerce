import { VendureEntity, Asset, DeepPartial } from '@vendure/core';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class Banner extends VendureEntity {
    constructor(input?: DeepPartial<Banner>) {
        super(input);
    }

    @Column()
    title: string;

    @Column({ nullable: true })
    subtitle: string;

    @ManyToOne(() => Asset, { nullable: true, eager: true })
    image: Asset;

    @Column({ nullable: true })
    primaryButtonLabel: string;

    @Column({ nullable: true })
    primaryButtonLink: string;

    @Column({ nullable: true })
    secondaryButtonLabel: string;

    @Column({ nullable: true })
    secondaryButtonLink: string;

    @Column({ default: 0 })
    order: number;
}
