interface MaterialIconProps {
    name: string
    filled?: boolean
    className?: string
}

function MaterialIcon({ name, filled = false, className = '' }: MaterialIconProps) {
return (
    <span
    className={`material-symbols-outlined ${className}`}
    style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
    >
    {name}
    </span>
)
}

export default MaterialIcon