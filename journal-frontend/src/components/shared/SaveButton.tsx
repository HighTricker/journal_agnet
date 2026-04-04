interface SaveButtonProps {
    label: string
    onSave?: () => void
}

function SaveButton({ label, onSave }: SaveButtonProps) {
    return (
        <button
            onClick={onSave}
            className="fixed bottom-10 right-10 md:bottom-8 bg-primary text-on-primary px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 z-40 hover:opacity-90 active:scale-95 transition-all"
        >
            {label}
        </button>
    )
}

export default SaveButton
