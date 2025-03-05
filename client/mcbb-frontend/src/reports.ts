/**
 * Type representing the access control level required to view a report.
 */
type AccessControl = 'Club Admin' | 'Faculty';

/**
 * Type representing a query parameter.
 * School will be replaced by the current school ID in the report generator on the backend
 * ID will be replaced by the id of the user, club, or event the report is being generated for
 */
type QueryParam = 'School' | 'ID';

/**
 * Interface representing a report.
 * @property {string} name - The name of the report
 * @property {string} query - The SQL query used to generate the report
 * @property {QueryParam[]} queryParams - The query parameters for the report
 * @property {AccessControl} accessControl - The access control level required to view the report
 */
export interface Report {
  name: string;
  query: string;
  queryParams: QueryParam[];
  accessControl: AccessControl;
}

/**
 * Interface representing the structure of the report object.
 * @property {Report[]} SCHOOL_WIDE - School-wide faculty-generated reports
 * @property {Report[]} CLUB - Reports for a specific club
 * @property {Report[]} USER - Reports for a specific user
 * @property {Report[]} EVENT - Reports for a specific event
 */
interface ReportObject {
  /** School-wide faculty-generated reports */
  SCHOOL_WIDE: Report[];
  /** Reports for a specific club */
  CLUB: Report[];
  /** Reports for a specific user */
  USER: Report[];
  /** Reports for a specific event */
  EVENT: Report[];
}

/**
 * Constant containing the predefined reports.
 */
const REPORTS: ReportObject = {
  SCHOOL_WIDE: [
    {
      name: 'User Activity Summary',
      query: /*sql*/ `
        WITH rsvp_counts AS (
          SELECT 
            user_id, 
            COUNT(rsvp_id) AS events_rsvpd
          FROM rsvp
          WHERE is_active = 1
            AND is_yes = 1
          GROUP BY user_id
        ),
        subscription_counts AS (
          SELECT 
            email, 
            COUNT(subscription_id) AS clubs_subscribed
          FROM user_subscription
          WHERE is_active = 1
            AND subscribed_or_blocked = 1
          GROUP BY email
        ),
        tag_groups AS (
          SELECT 
            ut.user_id, 
            GROUP_CONCAT(t.tag_name SEPARATOR ', ') AS interests
          FROM user_tags ut
          JOIN tag t ON ut.tag_id = t.tag_id
          GROUP BY ut.user_id
        )
        SELECT 
          u.email, 
          u.name, 
          COALESCE(r.events_rsvpd, 0) AS events_rsvpd, 
          COALESCE(us.clubs_subscribed, 0) AS clubs_subscribed,
          COALESCE(t.interests, '') AS interests
        FROM users u
        LEFT JOIN rsvp_counts r ON u.email = r.user_id
        LEFT JOIN subscription_counts us ON u.email = us.email
        LEFT JOIN tag_groups t ON u.email = t.user_id
        WHERE u.school_id = %s
        GROUP BY u.email, u.name;`,
      queryParams: ['School'],
      accessControl: 'Faculty'
    }
  ],
  CLUB: [],
  USER: [],
  EVENT: []
};

export default REPORTS;
