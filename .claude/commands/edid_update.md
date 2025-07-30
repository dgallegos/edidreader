# EDID Standards Update Command

Research the latest EDID standards, analyze the v4l-utils reference implementation, and determine updates needed for the EDID parser.

## Phase 1: Research Latest EDID Standards

Search for the most current EDID and display standards:
- Find the latest CTA-861 standard version (currently CTA-861-I with CTA-861.7 amendment)
- Research HDMI 2.1+ specifications and new features
- Look up DisplayID 2.0+ standards for modern displays
- Identify any new VESA standards or amendments
- Check for updated VIC (Video Identification Code) definitions

Focus areas:
- New extended data block types
- 8K/12K display format support
- HDR metadata enhancements (HDR10+, Dolby Vision updates)
- Gaming features (VRR, ALLM, QMS improvements)
- New color space definitions (BT.2100, ICtCp updates)

## Phase 2: Analyze v4l-utils Reference Implementation

Fetch and examine the latest edid-decode source code from:
https://git.linuxtv.org/v4l-utils.git/tree/utils/edid-decode

Key files to analyze:
- `edid-decode.cpp` - Main parsing logic
- `parse-cta-block.cpp` - CTA-861 extension parsing
- `parse-hdmi-block.cpp` - HDMI vendor-specific blocks
- `parse-displayid-block.cpp` - DisplayID parsing
- Any header files with constant definitions

Compare against current edid.js implementation:
1. **Extended Data Block Types**: Check if we have all the extended tag types defined in the reference
2. **VIC Code Definitions**: Compare our shortVideoDescriptors array with their VIC definitions
3. **HDMI VSDB Parsing**: Analyze their HDMI vendor-specific data block parsing logic
4. **HDR Support**: Compare HDR static/dynamic metadata parsing
5. **Color Space Support**: Check colorimetry and color space definitions
6. **Error Handling**: Review their approach to malformed EDID handling

## Phase 3: Gap Analysis

Compare our current implementation with the reference:

### Missing Features to Identify:
- Extended data block types we don't support
- VIC codes for newer display formats (8K@120Hz, 12K formats)
- HDMI 2.1+ features (eARC, DSC, FRL)
- New HDR metadata types
- DisplayID 2.0 support
- Updated color space definitions

### Implementation Differences:
- Parsing logic improvements
- Better error handling approaches
- Performance optimizations
- Standards compliance issues

## Phase 4: Update Recommendations

Generate specific actionable tasks:

### High Priority Updates:
- Add missing extended data block types with parsing functions
- Update VIC code definitions to latest CTA-861 standard
- Implement missing HDMI 2.1+ vendor-specific parsing
- Add new HDR metadata block support

### Medium Priority Updates:
- Enhance error handling for malformed EDIDs
- Add DisplayID 2.0 parsing support
- Update color space and colorimetry definitions
- Improve performance for large EDID parsing

### Low Priority Updates:
- Add debug/verbose parsing modes
- Implement additional validation checks
- Add support for proprietary vendor extensions

## Phase 5: Implementation Plan

For each identified update:
1. **Location**: Specify which files need changes (edid.js, controllers.js, HTML templates)
2. **Code Changes**: Provide specific code snippets or implementation guidance
3. **Testing**: Recommend test cases and validation approaches
4. **Documentation**: Note any UI or documentation updates needed

## Output Format

Provide a structured report with:
- Summary of current standards landscape
- Detailed gap analysis with specific missing features
- Prioritized list of updates with implementation details
- Estimated effort and complexity for each update
- Test plan recommendations

This command should be run periodically (every 6 months) to keep the EDID parser current with evolving display technology standards.