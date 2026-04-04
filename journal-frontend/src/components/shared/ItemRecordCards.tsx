interface ItemRecordCardsProps {
    title: string
    items: Array<{ label: string; placeholder?: string }>
    values?: Record<string, string>
    onChange?: (label: string, value: string) => void
}

function ItemRecordCards({ title, items, values, onChange }: ItemRecordCardsProps) {
    return (
        <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-6 opacity-80">
                {title}
            </h2>
            <div className="flex flex-wrap justify-center gap-6">
                {items.map((item) => (
                    <div
                        key={item.label}
                        className="w-[calc(25%-18px)] p-8 rounded-xl bg-surface-container-lowest border border-outline-variant/10 hover:border-primary/20 transition-all"
                    >
                        <p className="text-base font-bold text-primary mb-4">
                            {item.label}
                        </p>
                        <textarea
                            className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-sm text-on-surface-variant leading-relaxed resize-none min-h-[150px] p-0 placeholder:text-on-surface-variant/40"
                            placeholder={item.placeholder || '记录事项...'}
                            value={values?.[item.label] ?? ''}
                            onChange={(e) => onChange?.(item.label, e.target.value)}
                        />
                    </div>
                ))}
            </div>
        </section>
    )
}

export default ItemRecordCards
