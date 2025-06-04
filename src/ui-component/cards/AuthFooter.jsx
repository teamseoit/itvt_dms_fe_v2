import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

export default function AuthFooter() {
  return (
    <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
      <Typography variant="subtitle2" component={Link} href="https://scloud.vn" target="_blank" underline="hover">
        scloud.vn
      </Typography>
      <Typography variant="subtitle2" component={Link} href="https://itvungtau.net" target="_blank" underline="hover">
        &copy; itvungtau.net
      </Typography>
    </Stack>
  );
}
