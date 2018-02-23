import React from 'react';
import PropTypes from 'prop-types';
import './DataTable.css';

export default function DataTable(props) {
  const { className, colgroup, thead, children, ...rest } = props;

  return (
    <div className="table-fixed-header">
      <div className="table-header">
        <table className={className}>
          {colgroup}
          {thead}
        </table>
      </div>

      <div className="table-body" {...rest}>
        <table className={className}>
          {colgroup}
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}

DataTable.propTypes = {
  className: PropTypes.string,
  colgroup: PropTypes.element.isRequired,
  children: PropTypes.node,
  thead: PropTypes.element.isRequired
};

DataTable.defaultProps = {
  className: 'table table-striped',
  children: null
};
