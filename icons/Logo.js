import * as React from "react"

function Logo(props) {
  return (
    <span id="logo">
      <svg
        width={props.width}
        height={props.height}
        viewBox={`0 0 26 27`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        {...props}
      >
        <path fill="url(#pattern0)" d="M0 0H26V27H0z" />
        <defs>
          <pattern
            id="pattern0"
            patternContentUnits="objectBoundingBox"
            width={1}
            height={1}
          >
            <use
              xlinkHref="#image0_1_737"
              transform="matrix(.00394 0 0 .0038 0 -.012)"
            />
          </pattern>
          <image
            id="image0_1_737"
            width={254}
            height={270}
            xlinkHref="data:image/png;base64,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"
          />
        </defs>
      </svg>
    </span>
  )
}

export default Logo
