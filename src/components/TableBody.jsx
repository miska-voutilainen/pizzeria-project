import React from "react";

export default function TableBody({ children, ...props }) {
  return (
    <tbody {...props}>
      {React.Children.map(children, (child, index) =>
        React.cloneElement(child, {
          isEven: index % 2 === 1,
          ...child.props,
        })
      )}
    </tbody>
  );
}
