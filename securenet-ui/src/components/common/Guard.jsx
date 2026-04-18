export default function Guard({ allow, children }) {
  return allow ? children : null;
}
