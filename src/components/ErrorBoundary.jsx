import React, { Component } from "react";
class ErrorBoundary extends Component {
    state = {
        hasError: false,
        error: null,
    };
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (<div className="p-4 bg-red-50 border border-red-200 rounded m-4">
                    <h1 className="text-xl font-bold text-red-800">Something went wrong</h1>
                    <pre className="mt-2 text-sm text-red-600 overflow-auto">
                        {this.state.error?.toString()}
                    </pre>
                </div>);
        }
        return this.props.children;
    }
}
export default ErrorBoundary;
