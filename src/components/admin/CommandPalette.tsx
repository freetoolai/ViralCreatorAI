'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, UserCircle, Briefcase, Users, Plus, Home, X } from 'lucide-react';
import clsx from 'clsx';
import styles from './CommandPalette.module.css';

interface CommandItem {
    id: string;
    label: string;
    description: string;
    icon: React.ElementType;
    link?: string;
    action?: () => void;
    shortcut?: string;
    category: string;
}

export const CommandPalette: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    const commands: CommandItem[] = [
        { id: 'h', label: 'Dashboard', description: 'Go to overview', icon: Home, link: '/admin', category: 'Navigation' },
        { id: 'i', label: 'Influencers', description: 'Manage network', icon: Users, link: '/admin/influencers', category: 'Navigation' },
        { id: 'c', label: 'Campaigns', description: 'Track projects', icon: Briefcase, link: '/admin/campaigns', category: 'Navigation' },
        { id: 'cl', label: 'Clients', description: 'Client management', icon: UserCircle, link: '/admin/clients', category: 'Navigation' },
        { id: 'ni', label: 'New Influencer', description: 'Add a creator', icon: Plus, link: '/admin/influencers', category: 'Actions', shortcut: 'N' },
        { id: 'nc', label: 'New Campaign', description: 'Create project', icon: Plus, link: '/admin/campaigns', category: 'Actions' },
    ];

    const filteredCommands = query === ''
        ? commands
        : commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()) || c.category.toLowerCase().includes(query.toLowerCase()));

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setOpen(prev => !prev);
            }
            if (e.key === 'Escape') {
                setOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (open) {
            // Use setTimeout to avoid synchronous setState during render/effect cascade
            const timer = setTimeout(() => {
                inputRef.current?.focus();
                setActiveIndex(0);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [open]);

    const handleSelect = (item: CommandItem) => {
        if (item.link) {
            router.push(item.link);
        } else if (item.action) {
            item.action();
        }
        setOpen(false);
        setQuery('');
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => (prev + 1) % filteredCommands.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredCommands[activeIndex]) {
                handleSelect(filteredCommands[activeIndex]);
            }
        }
    };

    if (!open) return null;

    return (
        <div className={styles.overlay} onClick={() => setOpen(false)}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.searchWrapper}>
                    <Search className={styles.searchIcon} size={20} />
                    <input
                        ref={inputRef}
                        className={styles.input}
                        placeholder="Search for anything... (Campaigns, Influencers...)"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={onKeyDown}
                    />
                    <button className="btn btn-text" onClick={() => setOpen(false)} title="Close palette">
                        <X size={16} />
                    </button>
                </div>

                <div className={styles.results}>
                    {filteredCommands.length > 0 ? (
                        filteredCommands.map((item, index) => {
                            const showCategory = index === 0 || filteredCommands[index - 1].category !== item.category;
                            return (
                                <React.Fragment key={item.id}>
                                    {showCategory && <div className={styles.sectionLabel}>{item.category}</div>}
                                    <div
                                        className={clsx(styles.item, index === activeIndex && styles.itemActive)}
                                        onMouseEnter={() => setActiveIndex(index)}
                                        onClick={() => handleSelect(item)}
                                    >
                                        <div className={styles.itemContent}>
                                            <item.icon size={18} className={styles.searchIcon} />
                                            <div>
                                                <div className={styles.itemText}>{item.label}</div>
                                                <div className={styles.itemDescription}>{item.description}</div>
                                            </div>
                                        </div>
                                        {item.shortcut && <div className={styles.shortcut}>{item.shortcut}</div>}
                                    </div>
                                </React.Fragment>
                            );
                        })
                    ) : (
                        <div className={styles.emptyState}>
                            No results found for &quot;{query}&quot;
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
