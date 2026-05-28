import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Asset } from '@vendure/core';

@Entity('banner')
export class Banner {
    @PrimaryColumn('varchar')
    id: string;

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @Column('varchar', { length: 255 })
    title: string;

    @Column('varchar', { nullable: true, length: 255 })
    subtitle?: string;

    @Column('varchar', { nullable: true, length: 255 })
    imageId?: string;

    @ManyToOne(() => Asset, { eager: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'imageId' })
    image?: Asset;

    @Column('varchar', { nullable: true, length: 255 })
    primaryButtonLabel?: string;

    @Column('varchar', { nullable: true, length: 255 })
    primaryButtonLink?: string;

    @Column('varchar', { nullable: true, length: 255 })
    secondaryButtonLabel?: string;

    @Column('varchar', { nullable: true, length: 255 })
    secondaryButtonLink?: string;

    @Column('int', { default: 0 })
    order: number;
}
