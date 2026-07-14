# Mergington High School Activities

A website application that allows students to view and sign up for extracurricular activities at Mergington High School.

## Features

- View all available extracurricular activities
- Filter activities by category (Sports, Arts, Academic, Community, Technology)
- Filter activities by day of the week
- Filter activities by time of day (Before School, After School, Weekend)
- Filter activities by difficulty level (Beginner, Intermediate, Advanced)
- Search activities by keyword
- Dark mode support
- Teacher login and authentication
- Sign up students for activities (requires teacher login)
- Unregister students from activities (requires teacher login)

## API Endpoints

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/activities` | Get all activities. Supports optional query params: `day` (e.g. `Monday`), `start_time` and `end_time` (24-hour format, e.g. `15:00`) |
| GET | `/activities/days` | Get a list of all days that have activities scheduled |
| POST | `/activities/{activity_name}/signup` | Sign up a student for an activity (requires `email` and `teacher_username` query params) |
| POST | `/activities/{activity_name}/unregister` | Remove a student from an activity (requires `email` and `teacher_username` query params) |
| POST | `/auth/login` | Log in as a teacher (requires `username` and `password` query params) |
| GET | `/auth/check-session` | Check if a teacher session is still valid (requires `username` query param) |

> **Note:** Category filtering (Sports, Arts, etc.) and keyword search are applied in the browser and do not require additional API calls.

## Development Guide

For detailed setup and development instructions, please refer to our [Development Guide](../docs/how-to-develop.md).
