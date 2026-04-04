interface CardProps {
    children: React.ReactNode
    className?: string
}

function Card({ children, className = '' }: CardProps) {
    return (
        <section className={`bg-surface-container-lowest rounded-xl shadow-[0_4px_30px_0_rgba(0,40,142,0.03)] border
    border-outline-variant/10 ${className}`}>
        {children}
        </section>
    )
}

export default Card