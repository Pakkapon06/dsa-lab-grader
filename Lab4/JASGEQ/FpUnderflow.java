public class FpUnderflow {
    public static void main(String[] args) {
        double d = -1.7e308;
        System.out.println(d + "*10 == " + d * 10);
    }
}