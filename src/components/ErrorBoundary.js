import * as React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Log the error safely without relying on undefined helpers or unsupported APIs
    // You can replace this with your own logging service if desired.
    // For example: sendToLoggingService(error, info?.componentStack)
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught an error:', error, info?.componentStack);

    if (typeof this.props.onError === 'function') {
      try {
        this.props.onError(error, info);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Error in ErrorBoundary onError handler:', e);
      }
    }
  }

  render() {
    if (this.state.hasError) {
      // Render the provided fallback UI
      return this.props.fallback || null;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
