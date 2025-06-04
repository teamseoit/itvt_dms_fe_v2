import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function Footer() {
  return (
    <Stack
      direction="row"
      sx={{
        alignItems: 'center',
        justifyContent: 'space-between',
        pt: 3,
        mt: 'auto'
      }}
    >
      <Typography variant="caption">
        &copy; Thiết kế bởi{' '}
        <Typography component={Link} href="https://itvungtau.net/" underline="hover" target="_blank" color="secondary.main">
          Scloud.vn
        </Typography>
      </Typography>
    </Stack>
  );
}
