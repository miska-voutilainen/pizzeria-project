import "./TextButton.css"

const TextButton = ({text, onClick}) => {
    return (<p onClick={onClick} className="text-button">{text}</p>)
}

export default TextButton;