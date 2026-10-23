function FieldMessage({ id, children, error = false }) {
  return <span id={id} className={error ? 'field-message field-message--error' : 'field-message'} role={error ? 'alert' : undefined}>{children}</span>;
}

export default FieldMessage;
