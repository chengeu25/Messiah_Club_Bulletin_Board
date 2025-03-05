export interface Report {
  name: string;
  query: string;
  queryParams: string[];
}

interface ReportObject {
  SCHOOL_WIDE: Report[];
  CLUB: Report[];
  USER: Report[];
  EVENT: Report[];
}

const REPORTS: ReportObject = {
  SCHOOL_WIDE: [
    {
      name: 'User Activity Summary',
      query: /*sql*/`
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
        WHERE u.email = %s
          AND u.school_id = %s
        GROUP BY u.email, u.name;`,
      queryParams: ['email', 'school_id']
    }
  ],
  CLUB: [],
  USER: [],
  EVENT: []
};

export default REPORTS;
