import styles from "./InfoBox.module.css";

const classes = {
    default: styles.default,
    warning: styles.warning,
    success: styles.success,
    danger: styles.danger,
};

const fills = {
    default: "var(--accent)",
    warning: "var(--warning)",
    success: "var(--success)",
    danger: "var(--danger)",
};

export function InfoBox({
    asDiv = false,
    className = "",
    fullWidth = false,
    type = "default",
    ...props
}) {
    const classnames = `${styles.box} ${classes[type]}`;
    const fill = fills[type];

    return (
        <article
            className={`${classnames} ${className}`}
            style={{ width: fullWidth ? "100%" : "" }}
        >
            <div>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill={fill}
                    height="22"
                    width="22"
                >
                    {type === "default" ? (
                        <path d="M12,24A12,12,0,1,0,0,12,12.013,12.013,0,0,0,12,24ZM12,5a1.5,1.5,0,1,1-1.5,1.5A1.5,1.5,0,0,1,12,5Zm-1,5h1a2,2,0,0,1,2,2v6a1,1,0,0,1-2,0V12H11a1,1,0,0,1,0-2Z" />
                    ) : type === "warning" ? (
                        <path d="M23.64,18.1L14.24,2.28c-.47-.8-1.3-1.28-2.24-1.28s-1.77,.48-2.23,1.28L.36,18.1h0c-.47,.82-.47,1.79,0,2.6s1.31,1.3,2.24,1.3H21.41c.94,0,1.78-.49,2.24-1.3s.46-1.78-.01-2.6Zm-10.64-.1h-2v-2h2v2Zm0-4h-2v-6h2v6Z" />
                    ) : type === "success" ? (
                        <path d="M24,12c0-1.626-.714-3.16-1.925-4.124,.14-1.622-.44-3.211-1.59-4.362-1.15-1.149-2.735-1.728-4.277-1.555-2.014-2.556-6.365-2.604-8.332-.035-1.624-.144-3.211,.439-4.361,1.59-1.149,1.15-1.729,2.74-1.555,4.277-2.556,2.014-2.605,6.365-.035,8.333-.14,1.622,.44,3.211,1.59,4.362,1.15,1.149,2.737,1.73,4.277,1.555,2.014,2.556,6.365,2.604,8.332,.035,1.62,.136,3.21-.439,4.361-1.59,1.149-1.15,1.729-2.74,1.555-4.277,1.246-1.048,1.96-2.582,1.96-4.208Zm-6.46-1.434l-4.739,4.568c-1.163,1.161-3.066,1.151-4.229-.013l-2.252-2.092c-.404-.376-.428-1.009-.052-1.413,.377-.405,1.011-.427,1.413-.052l2.278,2.117c.418,.417,1.05,.416,1.44,.025l4.752-4.581c.398-.382,1.031-.371,1.414,.026,.384,.397,.372,1.031-.025,1.414Z" />
                    ) : type === "danger" ? (
                        <path d="m23.34,9.48l-3.5-6c-.893-1.53-2.547-2.48-4.319-2.48h-7.072c-1.771,0-3.426.95-4.319,2.48L.631,9.48c-.907,1.554-.907,3.485,0,5.039l3.5,6c.893,1.53,2.547,2.48,4.319,2.48h7.072c1.771,0,3.426-.95,4.319-2.48l3.5-6c.907-1.554.907-3.485,0-5.039Zm-12.34-2.48c0-.553.448-1,1-1s1,.447,1,1v5.5c0,.553-.448,1-1,1s-1-.447-1-1v-5.5Zm1,11c-.828,0-1.5-.672-1.5-1.5s.672-1.5,1.5-1.5,1.5.672,1.5,1.5-.672,1.5-1.5,1.5Z" />
                    ) : null}
                </svg>
            </div>

            {asDiv ? <div>{props.children}</div> : <p>{props.children}</p>}
        </article>
    );
}
