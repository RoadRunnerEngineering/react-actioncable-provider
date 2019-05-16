import React from 'react'
import PropTypes from 'prop-types'
import actioncable from 'actioncable'

const { Provider, Consumer } = React.createContext()

class ActionCableProvider extends React.Component {
  componentWillMount() {
    if (this.props.cable) {
      this.cable = this.props.cable
    } else {
      this.cable = actioncable.createConsumer(this.props.url)
    }
  }

  componentWillUnmount() {
    if (!this.props.cable && this.cable) {
      this.cable.disconnect()
    }
  }

  componentWillReceiveProps(nextProps) {
    // Props not changed
    if (
      this.props.cable === nextProps.cable &&
      this.props.url === nextProps.url
    ) {
      return
    }

    // cable is created by self, disconnect it
    this.componentWillUnmount()

    // create or assign cable
    this.componentWillMount()
  }

  render() {
    return (
      <Provider value={{ cable: this.cable }}>
        {this.props.children || null}
      </Provider>
    )
  }
}

ActionCableProvider.displayName = "ActionCableProvider"

ActionCableProvider.propTypes = {
  cable: PropTypes.object,
  url: PropTypes.string,
  children: PropTypes.any
}

class ActionCableController extends React.Component {
  componentDidMount() {
    var self = this
    var _props = this.props

    var onReceived = _props.onReceived

    var onInitialized = _props.onInitialized

    var onConnected = _props.onConnected

    var onDisconnected = _props.onDisconnected

    var onRejected = _props.onRejected

    this.cable = this.props.cable.subscriptions.create(this.props.channel, {
      received: function (data) {
        onReceived && onReceived(data)
      },
      initialized: function () {
        onInitialized && onInitialized()
      },
      connected: function () {
        onConnected && onConnected()
      },
      disconnected: function () {
        onDisconnected && onDisconnected()
      },
      rejected: function () {
        onRejected && onRejected()
      }
    })
  }

  componentWillUnmount() {
    if (this.cable) {
      this.props.cable.subscriptions.remove(this.cable)
      this.cable = null
    }
  }

  send(data) {
    if (!this.cable) {
      throw new Error("ActionCable component unloaded")
    }

    this.cable.send(data)
  }

  perform(action, data) {
    if (!this.cable) {
      throw new Error("ActionCable component unloaded")
    }

    this.cable.perform(action, data)
  }

  render() {
    return this.props.children || null
  }
}

ActionCableController.displayName = "ActionCableController"

ActionCableController.propTypes = {
  cable: PropTypes.object,
  onReceived: PropTypes.func,
  onInitialized: PropTypes.func,
  onConnected: PropTypes.func,
  onDisconnected: PropTypes.func,
  onRejected: PropTypes.func,
  children: PropTypes.any
}

const ActionCableConsumerWithRef = React.forwardRef(function (props, ref) {
  return (
    <ActionCableConsumer {...props} forwardedRef={ref}>
      {props.children || null}
    </ActionCableConsumer>
  )
})

class ActionCableConsumer extends React.Component {
  render() {
    return (
      <Consumer>
        {({ cable }) =>
          <ActionCableController
            cable={cable}
            {...this.props}
            ref={this.props.forwardedRef}
          >
            {this.props.children || null}
          </ActionCableController>
        }
      </Consumer>
    )
  }
}

ActionCableConsumer.displayName = "ActionCableConsumer"

ActionCableConsumer.propTypes = {
  onReceived: PropTypes.func,
  onInitialized: PropTypes.func,
  onConnected: PropTypes.func,
  onDisconnected: PropTypes.func,
  onRejected: PropTypes.func,
  children: PropTypes.any
}

class ActionCable extends React.Component {
  componentDidMount() {
    console.warn(
      "DEPRECATION WARNING: The <ActionCable /> component has been deprecated and will be removed in a future release. Use <ActionCableConsumer /> instead."
    )
  }
  render() {
    return (
      <ActionCableConsumer {...this.props}>
        {this.props.children || null}
      </ActionCableConsumer>
    )
  }
}

ActionCable.displayName = "ActionCable"

ActionCable.propTypes = {
  onReceived: PropTypes.func,
  onInitialized: PropTypes.func,
  onConnected: PropTypes.func,
  onDisconnected: PropTypes.func,
  onRejected: PropTypes.func,
  children: PropTypes.any
}

export {
  ActionCable,
  ActionCableConsumerWithRef as ActionCableConsumer,
  ActionCableController,
  ActionCableProvider
}

// Compatible old usage
export default ActionCableProvider