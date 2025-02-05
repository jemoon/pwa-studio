const reactIntl = jest.requireActual('react-intl');
const messages = require('../i18n/en_US.json');
const intl = reactIntl.createIntl({
    locale: 'en',
    messages
});

module.exports = {
    ...reactIntl,
    FormattedMessage: jest.fn(({ defaultMessage }) => defaultMessage),
    useIntl: jest.fn(() => intl)
};
