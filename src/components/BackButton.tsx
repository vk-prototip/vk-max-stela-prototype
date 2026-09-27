import backButtonImage from '../assets/images/controls/back.png'

interface BackButtonProps {
  onClick: () => void
}

export function BackButton({ onClick }: BackButtonProps) {
  return (
    <button
      className="back-button"
      type="button"
      aria-label="Назад"
      onClick={onClick}
    >
      <img src={backButtonImage} alt="" aria-hidden="true" />
    </button>
  )
}
